# 3D Automation System — Design Spec v0.1

**Data:** 2026-05-07  
**Status:** Aprovado  
**Stack:** Python + SketchUp 2023 + V-Ray 6 + Claude API  
**Modo:** Local-first, CLI (Fase 1) → Web UI (Fase 2)

---

## Objetivo

Sistema local de automação 3D que interpreta prompts em linguagem natural e produz renders de interiores automaticamente.

Fluxo mínimo viável:

```
python generate.py --prompt "sala moderna minimalista sofá bege"
      ↓
Claude API → JSON DSL
      ↓
AssetManager → resolve paths reais da biblioteca local
      ↓
ScriptLaunchBridge → gera runner.rb → abre SketchUp
      ↓
Ruby Engine → cria sala → insere móveis → configura V-Ray → renderiza
      ↓
outputs/renders/sala_moderna_TIMESTAMP.png
```

---

## Arquitetura

### Componentes e responsabilidades

| Componente | Responsabilidade | Fase |
|---|---|---|
| `generate.py` | CLI entry point | 1 |
| `Orchestrator` | Coordena todos os passos | 1 |
| `ClaudeClient` | Prompt → JSON DSL via Anthropic API | 1 |
| `AssetManager` | Resolve asset_ids em paths reais via SQLite | 1 |
| `ScriptLaunchBridge` | Gera runner.rb e lança sketchup.exe via subprocess | 1 |
| `SocketBridge` | HTTP para SketchUp com extensão WEBrick | 2 |
| `Ruby Engine` | Executa DSL dentro do SketchUp | 1 |
| `index_assets.py` | Indexa biblioteca local no SQLite | 1 |
| Web UI (FastAPI) | Interface browser localhost:8000 | 2 |

### Princípio de isolamento

O `SketchUpBridge` é o único componente que muda entre fases. Todos os outros — Orchestrator, ClaudeClient, AssetManager, Ruby Engine — são escritos uma vez e reutilizados.

Troca de fase = mudar `BRIDGE=script_launch` para `BRIDGE=socket` no `.env`.

---

## Estrutura de Pastas

```
3d-automation/
├── generate.py
├── config.py
├── requirements.txt
├── .env
├── core/
│   ├── orchestrator.py
│   ├── claude_client.py
│   ├── asset_manager.py
│   ├── dsl/
│   │   ├── schema.py          # Pydantic — contrato DSL v0.1
│   │   └── validator.py
│   └── bridge/
│       ├── __init__.py        # Factory get_bridge()
│       ├── base.py            # ABC SketchUpBridge
│       ├── script_launch.py   # Fase 1
│       └── socket_bridge.py   # Fase 2 (stub)
├── ruby/
│   └── engine/
│       ├── room_builder.rb
│       ├── component_placer.rb
│       ├── material_engine.rb
│       ├── camera_setup.rb
│       └── vray_config.rb
├── templates/
│   ├── ruby_runner.rb.j2      # Template Jinja2 do runner gerado
│   └── system_prompt.txt      # System prompt para Claude
├── scripts/
│   ├── generated/             # Runners .rb gerados dinamicamente
│   └── index_assets.py
├── assets/
│   ├── catalog.db             # SQLite — índice da biblioteca
│   ├── hdri/
│   └── materials/
├── queue/
│   ├── pending/               # Jobs aguardando execução
│   └── done/                  # Results + failed JSONs
├── outputs/
│   └── renders/
└── logs/
    └── app.log
```

---

## JSON DSL v0.1 — Schema

O DSL é o contrato permanente entre Python e Ruby. Nunca deve mudar de forma breaking entre fases.

### Campos obrigatórios

```
version       string   "0.1"
job_id        string   "job_YYYYMMDD_HHMMSS_xxxxxx"
scene.room    object   width_cm, depth_cm, height_cm
scene.materials  object  floor, walls (cada um: type + hex|path)
entities      array    lista de móveis/objetos
lighting      object   ambient (hdri|sky|color) + artificial[]
camera        object   position_cm, target_cm, focal_length_mm
render        object   engine, preset, resolution, output_path
meta          object   prompt, style, created_at
```

### Entity spec

```json
{
  "id": "ent_001",
  "asset_id": "sofas_meridiani_armo_a3b1",
  "path": null,
  "category": "sofas",
  "query_tags": ["bege", "moderno", "minimalista"],
  "transform": {
    "position_cm": [250, 280, 0],
    "rotation_deg": 180,
    "scale": [1.0, 1.0, 1.0]
  },
  "layer": "furniture"
}
```

`path` é `null` no output do Claude. `AssetManager.resolve()` preenche o path real antes da execução.

---

## Fluxo de Arquivos

```
queue/pending/job_001.json       ← Orchestrator escreve o DSL completo
scripts/generated/job_001_runner.rb  ← ScriptLaunchBridge gera via Jinja2
queue/done/job_001_result.json   ← Ruby Engine escreve ao terminar (sucesso)
queue/done/job_001_failed.json   ← Ruby Engine escreve em caso de erro
queue/done/job_001.skp           ← SketchUp salva o modelo final
outputs/renders/job_001.png      ← V-Ray exporta o render
```

---

## Ruby Engine — Módulos

### room_builder.rb
- Cria geometria da sala: piso (face), paredes (pushpull), teto
- Aplica materiais via `_material()`: suporta `color` (hex RGB) e `skm` (arquivo)
- Organiza em layer `AI_Room`

### component_placer.rb
- Itera `entities[]` do DSL
- Carrega cada `.skp` como ComponentDefinition (reutiliza se já carregado)
- Aplica transform: `Transformation.translation * rotation * scaling`
- Organiza em layer `AI_Furniture`
- Erros por asset não interrompem o job — loga e continua

### camera_setup.rb
- Cria `Sketchup::Camera` com `eye`, `target`, `up`
- Define focal length

### vray_config.rb
- Se `VRay` disponível: configura `SceneOptions`, HDRI, preset e renderiza
- Se V-Ray ausente: exporta PNG nativo via `view.write_image()` (fallback para dev)

### material_engine.rb
- Stub em Fase 1 (materiais aplicados pelo RoomBuilder)
- Fase 2: override de materiais em componentes importados por layer/tag

---

## Asset Manager — Estratégia de Indexação

### SQLite Schema

```sql
CREATE TABLE assets (
    id TEXT PRIMARY KEY,         -- hash MD5 do path absoluto
    name TEXT,
    category TEXT,               -- sofas, mesas, cadeiras, etc.
    style TEXT,                  -- moderno, rustico, classico, etc.
    tags TEXT,                   -- JSON array de strings
    path TEXT,                   -- path absoluto no HD
    indexed_at TEXT
);
```

### Estratégia de resolução (AssetManager.resolve)

1. Busca por `asset_id` exato
2. Se não encontrado: busca por `category` + `query_tags` (LIKE em tags)
3. Fallback: asset aleatório na mesma categoria

### Reindexação

```bash
python scripts/index_assets.py --root "C:/Collection Library"
```

Idempotente: usa MD5 do path — reindexar não duplica.

---

## Bridge — Fase 1 (ScriptLaunchBridge)

1. Jinja2 renderiza `ruby_runner.rb.j2` com paths do job
2. `subprocess.Popen([sketchup.exe, "-RubyStartup", runner.rb])`
3. Polling de 2s em `queue/done/` até `result.json` ou `failed.json`
4. Timeout configurável via `QUEUE_TIMEOUT_S` (padrão 300s)
5. `proc.terminate()` ao receber resultado ou timeout

---

## Bridge — Fase 2 (SocketBridge)

SketchUp precisa ter a extensão WEBrick instalada e rodando.

```python
requests.post("http://localhost:7654/execute", json=dsl, timeout=300)
```

Troca de bridge: setar `BRIDGE=socket` no `.env`. Zero reescrita em outros componentes.

---

## Padrões de Robustez

| Padrão | Implementação |
|---|---|
| Idempotência | `asset_id` = MD5(path absoluto) — reindexar é seguro |
| Erro isolado por asset | `component_placer.rb` usa `rescue` por entity, continua o job |
| Falha de job | Ruby Engine escreve `failed.json` com `error` + `backtrace[0..4]` |
| Transação SketchUp | `model.start_operation` / `abort_operation` em erro |
| Dry-run | `--dry-run` gera DSL e encerra sem abrir SketchUp |
| Fallback V-Ray | `vray_config.rb` exporta PNG nativo se V-Ray não disponível |

---

## Roadmap

### Fase 1 — MVP CLI (este spec)
- [ ] Estrutura de pastas e arquivos
- [ ] `config.py` + `.env`
- [ ] `core/dsl/schema.py` (Pydantic)
- [ ] `core/claude_client.py` + `templates/system_prompt.txt`
- [ ] `core/asset_manager.py` + SQLite
- [ ] `core/bridge/script_launch.py`
- [ ] `templates/ruby_runner.rb.j2`
- [ ] `ruby/engine/` — todos os 5 módulos
- [ ] `scripts/index_assets.py`
- [ ] `generate.py` CLI
- [ ] Teste end-to-end com prompt real

### Fase 2 — Web UI + Socket Bridge
- [ ] Extensão WEBrick para SketchUp
- [ ] `core/bridge/socket_bridge.py`
- [ ] FastAPI backend (`api/`)
- [ ] Frontend React/HTML — campo de prompt, logs, galeria
- [ ] ChromaDB para busca semântica de assets
- [ ] Thumbnails automáticos da biblioteca
- [ ] Presets de estilos de interiores
- [ ] Histórico de jobs

### Fase 3 — Engine Procedural
- [ ] Layout engine: posicionamento automático por regras de interiores
- [ ] Paleta de cores automática por estilo
- [ ] Multi-cena (vários ângulos por job)
- [ ] Render queue
- [ ] Exportação automática para portfólio

---

## Dependências

```
anthropic>=0.40.0
pydantic>=2.0.0
loguru>=0.7.0
jinja2>=3.0.0
python-dotenv>=1.0.0
requests>=2.31.0
watchdog>=4.0.0
```

**SketchUp:** 2023 em `C:\Program Files\SketchUp\SketchUp 2023\SketchUp.exe`  
**V-Ray:** 6.00.03 for SketchUp  
**Python:** 3.11+

---

## Decisões de Design

| Decisão | Escolha | Alternativa descartada | Motivo |
|---|---|---|---|
| Controle do SketchUp | subprocess + RubyStartup | Extensão nativa | Sem extensão no MVP; migração limpa para socket |
| DSL como camada intermediária | JSON DSL v0.1 | Prompt direto para Ruby | Desacopla transporte da execução; imutável entre fases |
| Asset lookup | SQLite | ChromaDB, JSON plano | Simples, local, sem dependência externa, busca estruturada suficiente para Fase 1 |
| Busca semântica | Fase 2 (ChromaDB) | Fase 1 | MVP precisa funcionar, não ser perfeito |
| Fallback V-Ray | PNG nativo SketchUp | Sem fallback | Permite dev/test sem V-Ray licenciado |
