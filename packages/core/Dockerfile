FROM node:24.22.3-alpine3.24@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5

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
