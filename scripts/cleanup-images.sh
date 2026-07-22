#!/bin/bash
# Tappy 的镜像名称及 GCP 项目 ID
IMAGE_NAME="gcr.io/xxyhelloword/github.com/lepfinder/Tappy"
KEEP_COUNT=3

echo "Fetching all Tappy image digests sorted by timestamp (JSON)..."
digests=$(gcloud container images list-tags "$IMAGE_NAME" --limit=99999 --sort-by=~TIMESTAMP --format=json | python3 -c "import sys, json; print(' '.join([img['digest'] for img in json.load(sys.stdin)]))")

count=0
for digest in $digests; do
  count=$((count+1))
  if [ $count -gt $KEEP_COUNT ]; then
    echo "Deleting old Tappy image digest: $digest"
    gcloud container images delete "${IMAGE_NAME}@${digest}" --force-delete-tags --quiet || true
  else
    echo "Keeping recent image digest [$count/$KEEP_COUNT]: $digest"
  fi
done

echo "Cleanup completed."
