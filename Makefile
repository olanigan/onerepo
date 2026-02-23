# GTD Stack Health Checks
FRONTEND_URL=https://gtd-frontend.salalite.workers.dev
GATEWAY_URL=https://gtd-gateway.salalite.workers.dev
BACKEND_URL=https://hono-d1-backend.salalite.workers.dev

.PHONY: health-all health-frontend health-gateway health-backend check-db

health-all: health-frontend health-gateway health-backend check-db

health-frontend:
	@echo "🔍 Checking Frontend..."
	@curl -s -o /dev/null -I -w "Status: %{http_code}\n" $(FRONTEND_URL)/
	@curl -s $(FRONTEND_URL)/ | grep -qi "FocusFlow" && echo "✅ Frontend: OK" || echo "❌ Frontend: Content Mismatch (FocusFlow not found)"

health-gateway:
	@echo "\n🔍 Checking Gateway..."
	@curl -s $(GATEWAY_URL)/health | grep -q '"status":"ok"' && echo "✅ Gateway: OK" || echo "❌ Gateway: Failed"
	@echo -n "   Registry: "
	@curl -s $(GATEWAY_URL)/backends
	@echo ""

health-backend:
	@echo "\n🔍 Checking Backend..."
	@curl -s $(BACKEND_URL)/health | grep -q '"status":"ok"' && echo "✅ Backend: OK" || echo "❌ Backend: Failed"

check-db:
	@echo "\n🔍 Checking D1 Database..."
	@wrangler d1 execute gtd-db --remote --command "SELECT 1;" > /dev/null 2>&1 && echo "✅ Database: Reachable" || echo "❌ Database: Unreachable"