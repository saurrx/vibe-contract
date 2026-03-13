# IDLs + Client Code Generation

## Goal
Never hand-maintain program clients. Use the IDL-driven, code-generated workflow.

## Anchor IDL Pipeline
1. `anchor build` produces the IDL at `target/idl/<program_name>.json`
2. The IDL describes all instructions, accounts, types, and errors
3. TypeScript clients use `@coral-xyz/anchor` to consume the IDL directly

## IDL Build Feature
Ensure `idl-build` is enabled in your program's `Cargo.toml`:
```toml
[features]
default = []
idl-build = ["anchor-lang/idl-build"]
```

## Using the IDL in TypeScript
```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "../target/idl/active_program.json";

const program = new Program(idl, provider);
await program.methods.initialize(data).accounts({ ... }).rpc();
```

## Do not
- Write IDLs by hand
- Hand-write Borsh layouts for programs you own — use the IDL/codegen pipeline
