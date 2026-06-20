Run `bun tls` to generate a locally-trusted dev certificate (uses mkcert
via the `tosijs-dev-certs` script shipped with tosijs-ui). The dev server
loads ./tls/key.pem and ./tls/certificate.pem.

Requires mkcert — `brew install mkcert` on macOS.
