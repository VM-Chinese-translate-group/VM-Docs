"""Trigger deployment and wait for its durable, final server result."""
import json
import os
import sys
import time
import urllib.error
import urllib.request


def request(method, url, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": "Bearer " + os.environ["DEPLOY_TOKEN"],
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def deploy():
    if not os.environ.get("DEPLOY_TOKEN"):
        raise RuntimeError("Missing repository secret DOCS_DEPLOY_TOKEN")
    endpoint = os.environ.get("DEPLOY_URL", "https://docs.vmct.top/internal/deploy").rstrip("/")
    payload = {"site": "docs", "sha": os.environ["SOURCE_SHA"],
               "artifact_sha": os.environ["ARTIFACT_SHA"]}
    deadline = time.monotonic() + 1200
    job = None
    for attempt in range(3):
        try:
            job = request("POST", endpoint, payload)
            break
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(5)
    print("Server deployment job:", job["id"], flush=True)
    status_url = endpoint + "/jobs/" + job["id"]
    while time.monotonic() < deadline:
        try:
            job = request("GET", status_url)
        except (urllib.error.URLError, TimeoutError):
            time.sleep(5)
            continue
        if job["status"] == "succeeded":
            result = job["result"]
            if result["sha"] != payload["sha"] or result["artifactSha"] != payload["artifact_sha"]:
                raise RuntimeError("Server reported success for a different revision")
            print("Deployment succeeded:", result["sha"], flush=True)
            return
        if job["status"] == "failed":
            raise RuntimeError("Server deployment failed: " + job.get("error", "unknown error"))
        print("Deployment status:", job["status"], flush=True)
        time.sleep(5)
    raise RuntimeError("Timed out waiting for the server deployment result (20 minutes)")


if __name__ == "__main__":
    try:
        deploy()
    except Exception as error:
        message = str(error).replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
        print("::error::" + message, file=sys.stderr)
        sys.exit(1)
