export function agentRouterChatEndpoint(baseUrl:string){const url=new URL(baseUrl);const path=url.pathname.replace(/\/$/,"");url.pathname=path===""?"/v1/chat/completions":path.endsWith("/chat/completions")?path:`${path}/chat/completions`;url.search="";url.hash="";return url.toString()}
export function agentRouterResponsesEndpoint(baseUrl:string){const url=new URL(baseUrl);const path=url.pathname.replace(/\/$/,"").replace(/\/chat\/completions$/,"");url.pathname=path===""?"/v1/responses":path.endsWith("/responses")?path:`${path}/responses`;url.search="";url.hash="";return url.toString()}
export function normalizeAgentRouterModel(model:string){return model.replace(/^openai\//,"")}
export function usesAgentRouterResponses(model:string){return normalizeAgentRouterModel(model)==="gpt-5.6-sol"}
