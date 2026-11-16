FROM node:24.22.2-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8

LABEL org.opencontainers.image.source="https://github.com/PiluVitu/Botai" \
      org.opencontainers.image.description="Botaí: pessoa brasileira de teste por HTTP (GET /pessoa, /pessoas, /saude) e pela CLI botai" \
      org.opencontainers.image.licenses="MIT"

# O tarball é o mesmo arquivo do npm publish; sem dependência, instala com --offline.
COPY pacote/botai-core.tgz /tmp/botai-core.tgz
RUN npm install --global --offline --no-audit --no-fund --no-update-notifier --ignore-scripts /tmp/botai-core.tgz \
 && rm /tmp/botai-core.tgz \
 && npm cache clean --force

USER node
EXPOSE 8790
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --start-interval=1s --retries=3 \
  CMD wget -q -T 2 -O /dev/null http://127.0.0.1:8790/saude || exit 1
ENTRYPOINT ["botai"]
CMD ["serve", "--host", "0.0.0.0", "--porta", "8790"]
