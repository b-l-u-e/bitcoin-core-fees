from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import requests
from json_rpc_request import (
    estimate_smart_fee, 
    get_mempool_info, 
    get_blockchain_info, 
    get_block_stats,
    get_block_count,
    get_mempool_percentile_fee_estimate,
    get_estimated_fee_rate_satvb,
    external_block_stats,
    external_fees_stats,
    external_fees_sum
)
from database import compute_summary
from database import init_db

# External analytics constants (mempool health stats)
BLOCK_INTERVAL = 200  # limit to avoid heavy RPC load
URL_API = "https://bitcoincorefeerate.com/fees/2/economical/2"

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)
CORS(app) 
try:
    init_db()
except Exception as e:
    print(f"DB init warning: {e}")

@app.route("/fees/<int:target>/<string:mode>/<int:level>", methods=['GET'])
def fees(target, mode, level):
    try:
        result = estimate_smart_fee(conf_target=target, mode=mode)
        return jsonify(result)
    except Exception as e:
        print(f"RPC Error: {e}")
        return jsonify({"error": f"Failed to get fee estimate: {str(e)}"}), 500

@app.route("/mempool/info", methods=['GET'])
def mempool_info():
    try:
        result = get_mempool_info()
        return jsonify(result)
    except Exception as e:
        print(f"RPC Error: {e}")
        return jsonify({"error": f"Failed to get mempool info: {str(e)}"}), 500

@app.route("/blockchain/info", methods=['GET'])
def blockchain_info():
    try:
        result = get_blockchain_info()
        return jsonify(result)
    except Exception as e:
        print(f"RPC Error: {e}")
        return jsonify({"error": f"Failed to get blockchain info: {str(e)}"}), 500

@app.route("/blockstats/<int:block_height>", methods=['GET'])
def block_stats(block_height):
    try:
        result = get_block_stats(block_height)
        return jsonify(result)
    except Exception as e:
        print(f"RPC Error: {e}")
        return jsonify({"error": f"Failed to get block stats: {str(e)}"}), 500

@app.route("/blockcount", methods=['GET'])
def block_count():
    try:
        result = get_block_count()
        return jsonify({"blockcount": result})
    except Exception as e:
        print(f"RPC Error: {e}")
        return jsonify({"error": f"Failed to get block count: {str(e)}"}), 500

@app.route("/health", methods=['GET'])
def health():
    try:
        get_blockchain_info()
        return jsonify({
            "status": "healthy", 
            "service": "bitcoin-core-fees-api",
            "rpc_connected": True
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "service": "bitcoin-core-fees-api",
            "rpc_connected": False,
            "error": str(e)
        }), 503

@app.route("/fees/mempool", methods=['GET'])
def mempool_fee_estimate():
    percentile_param = request.args.get("percentiles", "25,50,75")
    try:
        percentiles = [
            int(value.strip())
            for value in percentile_param.split(",")
            if value.strip()
        ]
    except ValueError:
        return jsonify({"error": "Percentiles must be integers"}), 400

    if not percentiles:
        percentiles = [50]

    invalid = [p for p in percentiles if p <= 0 or p >= 100]
    if invalid:
        return jsonify({"error": "Percentiles must be between 1 and 99"}), 400

    try:
        result = get_mempool_percentile_fee_estimate(percentiles)
        # Add coverage hint from analytics
        summary = compute_summary(limit=500)
        warnings = []
        avg_cov = summary.get("avg_block_coverage")
        if avg_cov is not None and avg_cov < 0.9:
            warnings.append(f"Low mempool alignment detected (avg block coverage {avg_cov}). Estimates may be skewed.")
        return jsonify({
            "mode": "mempool_percentile_estimator",
            "input_percentiles": percentiles,
            **result,
            "warnings": warnings
        })
    except Exception as e:
        print(f"RPC Error: {e}")
        return jsonify({"error": f"Failed to get mempool-based fee estimate: {str(e)}"}), 500

@app.route("/api/v1/fees/estimate", methods=['GET'])
def api_estimate():
    """
    Unified estimator endpoint.
    Query params:
      - method: 'mempool' | 'historical' | 'hybrid' (default: 'mempool')
      - target: confirmation target blocks (default: 1)
      - percentile: percentile for mempool method (default: 50)
    """
    method = request.args.get("method", default="mempool").lower()
    target = request.args.get("target", default=1, type=int)
    percentile = request.args.get("percentile", default=50, type=int)

    if percentile <= 0 or percentile >= 100:
        return jsonify({"error": "percentile must be between 1 and 99"}), 400
    if target <= 0:
        return jsonify({"error": "target must be >= 1"}), 400

    warnings = []
    # Coverage warning from analytics
    try:
        summary = compute_summary(limit=500)
        avg_cov = summary.get("avg_block_coverage")
        if avg_cov is not None and avg_cov < 0.9:
            warnings.append(f"Low mempool alignment detected (avg block coverage {avg_cov}). Estimates may be skewed.")
    except Exception:
        pass

    # Historical
    historical_rate = None
    try:
        hist = get_estimated_fee_rate_satvb(conf_target=target, mode="economical")
        historical_rate = hist.get("feerate_sat_per_vb")
        if hist.get("errors"):
            warnings.extend(hist.get("errors"))
    except Exception as e:
        warnings.append(f"historical estimator unavailable: {str(e)}")

    # Mempool
    mempool_rate = None
    if method in ("mempool", "hybrid"):
        try:
            mem = get_mempool_percentile_fee_estimate([percentile])
            # percentiles payload is list of dicts; take first
            plist = mem.get("percentiles") or []
            if plist:
                mempool_rate = plist[0].get("feerate_sat_per_vb")
        except Exception as e:
            warnings.append(f"mempool estimator unavailable: {str(e)}")
        if method == "mempool" and target > 1:
            warnings.append("mempool method is tuned for target=1; accuracy may degrade for multi-block targets.")

    result_rate = None
    chosen_method = method
    if method == "mempool":
        result_rate = mempool_rate
    elif method == "historical":
        result_rate = historical_rate
    elif method == "hybrid":
        # Simple policy: use mempool for target=1, otherwise historical
        if target == 1 and mempool_rate is not None:
            result_rate = mempool_rate
            chosen_method = "mempool"
        else:
            result_rate = historical_rate
            chosen_method = "historical"

    return jsonify({
        "method": chosen_method,
        "requested_method": method,
        "target": target,
        "percentile": percentile,
        "fee_rate_sat_per_vb": result_rate,
        "components": {
            "mempool": mempool_rate,
            "historical": historical_rate
        },
        "warnings": warnings
    })

@app.route("/analytics/summary", methods=['GET'])
def analytics_summary():
    limit = request.args.get("limit", default=1000, type=int)
    forecaster = request.args.get("forecaster", default="OurModelV1")

    if limit is None or limit <= 0:
        limit = 100
    limit = min(limit, 5000)

    try:
        summary = compute_summary(limit=limit, forecaster_name=forecaster)
        # If no data yet, try external fallback
        if not summary or summary.get("total", 0) == 0:
            try:
                ext = external_fees_sum(limit)
                # Return as-is but mark source
                if isinstance(ext, dict):
                    ext["source"] = "external"
                return jsonify(ext)
            except Exception as e:
                print(f"External summary fallback failed: {e}")
        # Mark source for clarity
        summary["source"] = "internal"
        return jsonify(summary)
    except Exception as e:
        print(f"Analytics Error: {e}")
        return jsonify({"error": f"Failed to compute analytics summary: {str(e)}"}), 500

@app.route("/external/block-stats/<int:count>", methods=['GET'])
def proxy_external_block_stats(count: int):
    try:
        data = external_block_stats(count)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"External block-stats failed: {str(e)}"}), 502

@app.route("/external/fees-stats/<int:count>", methods=['GET'])
def proxy_external_fees_stats(count: int):
    try:
        data = external_fees_stats(count)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"External fees-stats failed: {str(e)}"}), 502

@app.route("/external/fees-sum/<int:count>", methods=['GET'])
def proxy_external_fees_sum(count: int):
    try:
        data = external_fees_sum(count)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"External fees-sum failed: {str(e)}"}), 502

def _percentile(values, p):
    """Compute percentile with linear interpolation."""
    if not values:
        return None
    values = sorted(values)
    k = (len(values) - 1) * (p / 100.0)
    f = int(k)
    c = min(f + 1, len(values) - 1)
    if f == c:
        return values[int(k)]
    return values[f] + (values[c] - values[f]) * (k - f)


def _classify_block(avg_fee, p25, p75):
    if avg_fee is None or p25 is None or p75 is None:
        return "unknown"
    if avg_fee > p75:
        return "overpaid"
    if avg_fee < p25:
        return "underpaid"
    return "within_range"


@app.route("/analytics/mempool-health", methods=["GET"])
def analytics_mempool_health():
    """
    Local mempool health over a block window using getblockstats.
    Query params:
      - start_height (int, required)
      - interval (int, optional, default BLOCK_INTERVAL, max 2000)
      - source=external to force old external dataset (mainnet only)
    """
    try:
        start_height = int(request.args.get("start_height"))
    except (TypeError, ValueError):
        return jsonify({"error": "start_height is required and must be an integer"}), 400

    interval = request.args.get("interval", default=BLOCK_INTERVAL, type=int)
    if interval <= 0 or interval > 2000:
        return jsonify({"error": "interval must be between 1 and 2000"}), 400

    end_height = start_height + interval
    use_external = request.args.get("source", "").lower() == "external"

    # External mode (mainnet-only) preserved for compatibility
    if use_external:
        try:
            r = requests.get(URL_API, timeout=30)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            return jsonify({"error": f"Failed to fetch external mempool health stats: {str(e)}"}), 502

        mempool_stats = data.get("mempool_health_statistics", [])
        block_ratios = {}
        for entry in mempool_stats:
            h = entry.get("block_height")
            ratio = entry.get("ratio")
            if h is None or ratio is None:
                continue
            block_ratios.setdefault(h, []).append(ratio)

        blocks = []
        counts = {"overpaid": 0, "underpaid": 0, "within_range": 0}
        for height in range(start_height, end_height):
            ratios = block_ratios.get(height, [])
            if not ratios:
                continue
            p25 = _percentile(ratios, 25)
            p75 = _percentile(ratios, 75)
            avg_fee = sum(ratios) / len(ratios)
            status = _classify_block(avg_fee, p25, p75)
            if status in counts:
                counts[status] += 1
            blocks.append({
                "height": height,
                "p25": p25,
                "p75": p75,
                "avgFee": avg_fee,
                "status": status
            })
    else:
        # Local mode: derive from getblockstats (works on signet/mainnet)
        blocks = []
        counts = {"overpaid": 0, "underpaid": 0, "within_range": 0}
        skipped = []
        for height in range(start_height, end_height):
            try:
                stats = get_block_stats(height)
            except Exception as e:
                skipped.append({"height": height, "reason": f"rpc_error: {e}"})
                continue

            percentiles = stats.get("feerate_percentiles") or []
            if len(percentiles) < 4:
                skipped.append({"height": height, "reason": "missing_percentiles"})
                continue
            # getblockstats returns [p10, p25, p50, p75, p90]
            p25 = percentiles[1]
            p75 = percentiles[3]
            avg_fee = stats.get("avgfeerate")
            status = _classify_block(avg_fee, p25, p75)
            if status in counts:
                counts[status] += 1
            blocks.append({
                "height": stats.get("height", height),
                "p25": p25,
                "p75": p75,
                "avgFee": avg_fee,
                "status": status
            })

    total_blocks = len(blocks)
    summary = {
        "overpaid": {
            "count": counts["overpaid"],
            "percent": round(counts["overpaid"] / total_blocks * 100, 2) if total_blocks else 0
        },
        "underpaid": {
            "count": counts["underpaid"],
            "percent": round(counts["underpaid"] / total_blocks * 100, 2) if total_blocks else 0
        },
        "within": {
            "count": counts["within_range"],
            "percent": round(counts["within_range"] / total_blocks * 100, 2) if total_blocks else 0
        },
    }

    latest_block_height = max([b["height"] for b in blocks], default=start_height)

    return jsonify({
        "source": "external" if use_external else "local",
        "start_height": start_height,
        "end_height": end_height,
        "latest_block_height": latest_block_height,
        "blocks": blocks,
        "summary": summary
    })

@app.errorhandler(404)
def page_not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
