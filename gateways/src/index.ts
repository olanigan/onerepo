export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const backendType = request.headers.get("x-backend") || "default";
    
    // Map backend types to local ports for development
    // In production, these would be separate worker service bindings or external URLs
    const portMap: Record<string, number> = {
      "rails": 3000,
      "phoenix": 4000,
      "laravel": 8000,
      "dotnet": 5000,
      "java": 8080,
      "default": 4000 
    };

    const targetPort = portMap[backendType] || portMap["default"];
    const targetUrl = `http://localhost:${targetPort}${url.pathname}${url.search}`;

    // Create a new request to forward
    const newRequest = new Request(targetUrl, request);

    try {
      return await fetch(newRequest);
    } catch (e) {
      return new Response(`Gateway Error: Could not connect to backend '${backendType}' at ${targetUrl}`, { status: 502 });
    }
  },
};
