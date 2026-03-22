

# Fix Rollup Path Traversal Vulnerability (CVE in Dependabot Alert #30)

## Risk Assessment

**How you're affected**: Rollup 4.45.1 is pulled in as a transitive dependency via `vite 6.3.5` (line 87 of package.json). You don't use rollup directly, but Vite uses it internally for production builds.

**Practical risk for this project**: **Low-to-moderate**. The exploit requires either:
- A malicious Rollup plugin in your build chain (you don't have any custom rollup plugins)
- Running `rollup` CLI with attacker-controlled input names (you don't do this)
- A malicious dependency that acts as a Rollup plugin during build

The main real-world risk is **supply chain**: if any npm dependency you install in the future acts as a malicious Vite/Rollup plugin, it could write files outside the build output directory during `vite build`.

## Fix

Add an `overrides` field to `package.json` to force rollup to the patched version:

```json
"overrides": {
  "rollup": ">=4.59.0"
}
```

This tells npm to resolve all instances of rollup (including transitive ones from vite) to 4.59.0+, which patches the path traversal in `sanitizeFileName.ts`.

## What changes

- `package.json`: Add `overrides` block
- No code changes, no behavior changes — rollup is only used internally by Vite during builds

