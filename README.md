# OneRepo: The Distributed Agentic Operating System Lab

> **"One Specification. Multiple Realities. Zero Tech Debt."**

`onerepo` is a centralized research hub for the next generation of agentic software architectures. It serves as a playground for evaluating how different frameworks, runtimes, and persistence models stand up to the rigorous requirements of autonomous AI agents.

## 🔭 The Vision

Our mission is to move beyond "Hello World" demos and into the era of **deterministic, high-performance agentic systems**. We believe that by building against unified specifications and comparing implementations head-to-head, we can discover the optimal patterns for:

1.  **State Persistence**: Ensuring agent memory survives restarts and scales effortlessly.
2.  **Architectural Optionality**: Swapping backends (Bun, Hono, Spring Boot) without breaking the mental model.
3.  **Protocol Excellence**: Pushing the boundaries of the Model Context Protocol (MCP) to bridge the gap between AI and software tools.

## 🏗️ Core Components

### 1. [Backends](./backends) (The Multi-Engine Lab)
The `backends` directory explores the **"Single Frontend, Multiple Backends"** pattern. We implement the same business logic (e.g., GTD, Project Management) across various stacks to measure:
- **DX**: Developer experience and velocity.
- **Latency**: Real-world performance under agentic load.
- **Scalability**: How different database models (D1, SQLite, Spring Data) handle complexity.

### 2. [MCP](./mcp) (The Shootout)
The `mcp` directory (formerly the *MCP Server Shootout*) is a head-to-head comparison of MCP implementations. We take a canonical specification — such as the **Bookmark & Knowledge Base** — and implement it across:
- Cloudflare Workers (Durable Objects, D1)
- Python (FastMCP)
- Vanilla TypeScript (stdio)
- Bun + Hono
- Vercel AI SDK

## 🛠️ Getting Started

This repo uses Git submodules to maintain deterministic versioning of its research labs.

### Setup
```bash
make setup
```

### Keeping it Fresh
To pull the latest updates from the underlying research branches:
```bash
make update
```

## 📜 Governance
This project follows the **Mega Engine** governance model, prioritizing:
- **NCL (No Context Loss)**: Deeply documented design decisions.
- **ZTD (Zero Tech Debt)**: Enforced through strict linting and validation gates.
- **Atomic Traceability**: All changes are tracked via the `OneCoder CLI`.

---
*Built with curiosity by the OneCoder Team.*
