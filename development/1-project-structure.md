---
title: Project Structure
---

# Project Structure

This page documents the repository layout and package organization of the Mocket web framework. It explains how the codebase is structured to support multiple compilation targets (JavaScript, Native, WASM) while maintaining a clean separation between core framework code and platform-specific implementations.

For information on building and testing the project, see [Building and Testing](#6.2). For deployment considerations, see [Deployment](#6.3).

## Repository Root Structure

The Mocket repository follows a standard MoonBit package layout with target-specific configurations. The root directory contains package metadata, build configuration, and essential project files.

```mermaid
graph TB
    Root["Repository Root"]
    ModJson["moon.mod.json<br/>Package metadata"]
    License["LICENSE<br/>Apache-2.0"]
    Readme["README.md<br/>Documentation"]
    GitIgnore[".gitignore<br/>Git exclusions"]
    SrcDir["src/<br/>Source code directory"]
    
    Root --> ModJson
    Root --> License
    Root --> Readme
    Root --> GitIgnore
    Root --> SrcDir
    
    SrcDir --> PkgJson["moon.pkg.json<br/>Build configuration"]
    SrcDir --> CoreFiles["*.mbt<br/>Core framework code"]
    SrcDir --> TargetFiles["mocket.*.mbt<br/>Backend implementations"]
    SrcDir --> FFIFiles["*.stub.c, *.c<br/>Native FFI code"]
    SrcDir --> ExampleDir["example/<br/>Example application"]
```

**Key Files:**

| File | Purpose |
|------|---------|
| `moon.mod.json` | Package metadata, versioning, and external dependencies |
| `src/moon.pkg.json` | Build configuration, target specifications, and compiler options |
| `.gitignore` | Excludes `node_modules/`, `target/`, `.mooncakes/`, and OS artifacts |
| `LICENSE` | Apache License 2.0 terms |

Sources: `moon.mod.json:1-20`, .gitignore:1-4, `LICENSE:1-203`

## Package Metadata (moon.mod.json)

The `moon.mod.json` file defines the package identity and external dependencies. This is the entry point for the MoonBit package manager.

```mermaid
graph LR
    Package["oboard/mocket<br/>v0.5.4"]
    
    RegExp["yj-qin/regexp<br/>v0.3.6"]
    Native["illusory0x0/native<br/>v0.2.1"]
    MoonX["moonbitlang/x<br/>v0.4.34"]
    URI["tonyfettes/uri<br/>v0.1.0"]
    
    Package -->|"Route pattern matching"| RegExp
    Package -->|"C FFI utilities"| Native
    Package -->|"Standard library extensions"| MoonX
    Package -->|"URI parsing"| URI
```

**Package Configuration Details:**

| Field | Value | Purpose |
|-------|-------|---------|
| `name` | `oboard/mocket` | Package identifier in registry |
| `version` | `0.5.4` | Current release version |
| `source` | `src` | Source code directory |
| `preferred-target` | `native` | Default compilation target |
| `license` | `Apache-2.0` | Open source license |
| `keywords` | `["http", "server"]` | Package discovery tags |

The dependency list includes four external packages that provide critical functionality not available in the MoonBit standard library. For detailed information on why these dependencies are needed, see [Package Dependencies](#1.2).

Sources: `moon.mod.json:1-20`

## Build Configuration (moon.pkg.json)

The `src/moon.pkg.json` file configures how the package is compiled for different targets. It defines target-specific file mappings, FFI bindings, and compiler options.

### Target-Specific File Mapping

Mocket uses conditional compilation to select the appropriate backend implementation based on the build target. The `targets` field maps specific files to compilation targets:

```mermaid
graph TB
    subgraph "Build Targets"
        JSTarget["js target"]
        NativeTarget["native target"]
        WASMTarget["wasm/wasm-gc target"]
    end
    
    subgraph "Backend Implementation Files"
        JSFile["mocket.js.mbt<br/>JavaScript backend"]
        NativeFile["mocket.native.mbt<br/>Native backend"]
        WASMFile["mocket.wasm.mbt<br/>WASM stub"]
    end
    
    subgraph "Core Framework Files"
        CoreFiles["index.mbt, event.mbt,<br/>path_match.mbt, logger.mbt, etc."]
    end
    
    JSTarget -.->|"includes"| JSFile
    NativeTarget -.->|"includes"| NativeFile
    WASMTarget -.->|"includes"| WASMFile
    
    JSTarget -->|"always includes"| CoreFiles
    NativeTarget -->|"always includes"| CoreFiles
    WASMTarget -->|"always includes"| CoreFiles
```

The `targets` mapping at `src/moon.pkg.json:18-29` ensures that:
- When compiling for `js`, only `mocket.js.mbt` is included
- When compiling for `native`, only `mocket.native.mbt` is included  
- When compiling for `wasm` or `wasm-gc`, only `mocket.wasm.mbt` is included
- Core framework files without target suffixes are included in all builds

### Native FFI Configuration

For the native backend, C source files must be linked with the MoonBit code. The `native-stub` field specifies these files:

| File | Purpose |
|------|---------|
| `mocket.stub.c` | FFI bindings between MoonBit and Mongoose |
| `mongoose.c` | Mongoose embedded HTTP server implementation |

These files are only compiled and linked when building for the `native` target.

### Compiler Options

The build configuration specifies several important settings:

```json
{
  "supported-targets": ["js", "native", "llvm"],
  "warn-list": "-15-29"
}
```

- `supported-targets`: This package can be compiled to JavaScript, native binaries, and LLVM IR
- `warn-list`: Disables specific compiler warnings (codes 15-29)

Sources: `src/moon.pkg.json:1-30`

## Source Code Organization

The `src/` directory contains all framework implementation code, organized by responsibility:

### Core Framework Files

| File Pattern | Purpose |
|--------------|---------|
| `index.mbt` | Main `Mocket` type, route registration API (`get`, `post`, etc.) |
| `event.mbt` | `HttpEvent`, `HttpRequest`, `HttpResponse`, `HttpBody` types |
| `path_match.mbt` | Route matching logic, static vs dynamic route optimization |
| `logger.mbt` | `Logger` trait and logging implementations |

These files contain backend-agnostic code and define the public API of the framework.

### Backend Implementation Files

```mermaid
graph LR
    subgraph "Backend Files"
        JS["mocket.js.mbt<br/>JavaScript implementation"]
        Native["mocket.native.mbt<br/>Native implementation"]
        WASM["mocket.wasm.mbt<br/>WASM stub"]
    end
    
    subgraph "FFI Support Files"
        JSAsync["js/async.mbt<br/>Promise support"]
        JSBody["js/body_reader.mbt<br/>Body parsing"]
        NativeBody["native/body_reader.mbt<br/>Body parsing"]
        CStub["mocket.stub.c<br/>C FFI bindings"]
        Mongoose["mongoose.c<br/>HTTP server"]
    end
    
    JS --> JSAsync
    JS --> JSBody
    Native --> NativeBody
    Native --> CStub
    Native --> Mongoose
    WASM -.->|"unimplemented"| Panic["panic()"]
```

Each backend file implements the `serve_ffi` function with a platform-specific signature:
- **JavaScript**: Integrates with Node.js HTTP server via `js.Value` FFI types
- **Native**: Integrates with Mongoose C library via `native.CStr` FFI types  
- **WASM**: Currently contains only a stub that panics at `src/mocket.wasm.mbt:2-5`

### Backend-Specific Subdirectories

The `js/` and `native/` subdirectories contain supporting code for their respective backends:

**JavaScript Backend (`src/js/`):**
- `async.mbt` - Promise-based async operations, suspend/resume patterns
- `body_reader.mbt` - Request body parsing for Node.js streams

**Native Backend (`src/native/`):**
- `body_reader.mbt` - Request body parsing for Mongoose C structures

Sources: `src/moon.pkg.json:14-29`, `src/mocket.wasm.mbt:1-5`

## Multi-Target Build System

The following diagram illustrates how the build system selects files based on the compilation target:

```mermaid
graph TB
    MoonBuild["moon build --target X"]
    
    subgraph "Target Selection"
        JSCheck{{"target == js?"}}
        NativeCheck{{"target == native?"}}
        WASMCheck{{"target == wasm<br/>or wasm-gc?"}}
    end
    
    subgraph "File Inclusion"
        CoreInclude["Include all *.mbt<br/>without target suffix"]
        JSInclude["Include mocket.js.mbt<br/>+ js/*.mbt"]
        NativeInclude["Include mocket.native.mbt<br/>+ native/*.mbt<br/>+ *.c FFI files"]
        WASMInclude["Include mocket.wasm.mbt"]
    end
    
    MoonBuild --> CoreInclude
    MoonBuild --> JSCheck
    MoonBuild --> NativeCheck
    MoonBuild --> WASMCheck
    
    JSCheck -->|"yes"| JSInclude
    NativeCheck -->|"yes"| NativeInclude
    WASMCheck -->|"yes"| WASMInclude
```

This architecture allows the same application code to run on multiple platforms without modification, as the core framework API remains consistent across all targets.

Sources: `src/moon.pkg.json:8-29`

## Build Artifacts and Exclusions

The `.gitignore` file specifies which directories are excluded from version control:

| Directory | Contents |
|-----------|----------|
| `node_modules/` | JavaScript dependencies (for JS backend testing) |
| `target/` | MoonBit compiler output (binaries, intermediate files) |
| `.mooncakes/` | MoonBit package cache |
| `.DS_Store` | macOS filesystem metadata |

These directories are regenerated during the build process and should not be committed to the repository.

Sources: .gitignore:1-4

## Example Application Structure

The `src/example/` directory contains a sample application demonstrating framework usage. This example is referenced in the root `moon.mod.json` and can be built alongside the framework or used as a template for new projects.

```mermaid
graph TB
    Example["src/example/main.mbt"]
    
    Framework["Core Framework<br/>index.mbt, event.mbt, etc."]
    Backend["Backend Implementation<br/>mocket.*.mbt"]
    
    Example -->|"imports"| Framework
    Framework -->|"delegates to"| Backend
```

The example application demonstrates typical usage patterns including route registration, middleware, and response handling. It serves as both documentation and a test case for the framework's public API.

Sources: `moon.mod.json:18`