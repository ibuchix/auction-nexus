

# Fix minimatch ReDoS Vulnerability (Dependabot Alert #29)

## Risk Assessment

`minimatch 3.1.2` is a transitive dependency via `eslint 9.31.0`. Development-only — never runs in production. **Very low** practical risk since no user input reaches ESLint's glob matching.

## Fix

Add `minimatch` to the existing `overrides` block in `package.json`:

```json
"overrides": {
  "rollup": ">=4.59.0",
  "flatted": ">=3.4.2",
  "minimatch": ">=9.0.7"
}
```

## What changes

- `package.json`: Add 1 line to `overrides`
- No code or behavior changes

