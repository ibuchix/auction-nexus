

# Fix WhatsApp Button Cross-Origin Error

## Problem
Safari blocks the WhatsApp link (`target="_blank"`) due to Cross-Origin-Opener-Policy. The `wa.me` redirect to `api.whatsapp.com` triggers this.

## Fix
In `src/components/admin/seller-management/SellerList.tsx`, change the `<a>` tag to a `<button>` that uses `window.open()` with `'_blank', 'noopener,noreferrer'` params. This avoids the COOP issue in Safari.

```tsx
<button
  onClick={() => window.open(`https://wa.me/${seller.mobile_number!.replace(/[^0-9]/g, '')}`, '_blank', 'noopener,noreferrer')}
  title="Chat on WhatsApp"
  className="inline-flex items-center justify-center rounded-full w-5 h-5 bg-green-500 hover:bg-green-600 transition-colors"
>
  <MessageCircle className="w-3 h-3 text-white" />
</button>
```

Single file change, lines 78-87 of `SellerList.tsx`.

