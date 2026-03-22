

# Fix flatted DoS Vulnerability (Dependabot Alert #35)

## Risk Assessment

**How you're affected**: `flatted 3.3.1` is a transitive dependency via `eslint 9.31.0`. It's used only during development (linting), never in production builds or runtime code.

**Practical risk**: **Very low**. The exploit requires passing untrusted input to `flatted.parse()`, which only happens inside ESLint's internal caching. No user input ever reaches this code path.

## Fix

Add `flatted` to the existing `overrides` block in `package.json`:

```json
"overrides": {
  "rollup": ">=4.59.0",
  "flatted": ">=3.4.2"
}
```

## What changes

- `package.json`: Add `flatted` override (1 line)
- No code changes, no behavior changes

