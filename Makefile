.PHONY: test lint stop \
        test-core build-core \
        dev-botai build-botai test-botai test-e2e-botai storybook-botai zip-botai versao-botai release-botai capturas-botai \
        dev-botai-site build-botai-site test-botai-site test-e2e-botai-site storybook-botai-site

test:
	pnpm -r test && node --test scripts/*.test.mjs

lint:
	pnpm -r lint

stop:
	@for p in 3018 6018 3020 6019; do \
		pids=$$(lsof -ti tcp:$$p -sTCP:LISTEN 2>/dev/null); \
		if [ -n "$$pids" ]; then kill $$pids 2>/dev/null && echo "killed :$$p ($$pids)"; else echo ":$$p free"; fi; \
	done

# --- core (@pilutech/botai-core, publicado no npm) ---
test-core:
	pnpm --filter @pilutech/botai-core test

build-core:
	pnpm --filter @pilutech/botai-core build

# --- extensão (MV3 para Chrome, Edge, Opera e Firefox, WXT) ---
# Dev em 3018 e Storybook em 6018. Carregar .output/chrome-mv3-dev sem empacotar; o dev acrescenta `tabs` e
# host de localhost ao manifesto, então bug de activeTab só aparece no build.
dev-botai:
	pnpm --filter @pilutech/botai dev

build-botai:
	pnpm --filter @pilutech/botai build

test-botai:
	pnpm --filter @pilutech/botai test

test-e2e-botai:
	pnpm --filter @pilutech/botai test:e2e

storybook-botai:
	pnpm --filter @pilutech/botai storybook

# Os 3 pacotes (Chrome e Edge, Firefox, Opera sem minificar) + o zip de fontes da AMO em extensao/.output/.
zip-botai:
	pnpm --filter @pilutech/botai zip

# Versão e release (ver "Publicação" em extensao/CLAUDE.md). O repo só aceita squash:
# o bump vai num PR e a tag sai na main depois do merge.
versao-botai:
	@test -n "$(V)" || { echo "uso: make versao-botai V=x.y.z" >&2; exit 1; }
	bash extensao/scripts/versao.sh $(V)

release-botai:
	bash extensao/scripts/release.sh

# Imagens das lojas em extensao/loja/imagens/ e cópias para o site/. Rode no Mac: a vitrine usa as fontes do sistema.
capturas-botai:
	pnpm --filter @pilutech/botai capturas

# --- site (landing do Botaí, Next 16) ---
# Dev em 3020 e Storybook em 6019. O E2E builda e serve a produção; rode com CI=1.
dev-botai-site:
	pnpm --filter @pilutech/botai-site dev

build-botai-site:
	pnpm --filter @pilutech/botai-site build

test-botai-site:
	pnpm --filter @pilutech/botai-site test

test-e2e-botai-site:
	CI=1 pnpm --filter @pilutech/botai-site test:e2e

storybook-botai-site:
	pnpm --filter @pilutech/botai-site storybook
