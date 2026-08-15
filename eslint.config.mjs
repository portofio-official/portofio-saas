import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const SERVER_ONLY_MODULES = [
  "@/lib/supabase/server",
  "@/lib/supabase/admin",
  "@/lib/rate-limit",
];

const STORE_MODULE_RE = /^@\/lib\/[^/]+\/store$/;

function hasUseClientDirective(context) {
  const body = context.sourceCode.ast.body;
  const first = body[0];
  return (
    first &&
    first.type === "ExpressionStatement" &&
    first.expression.type === "Literal" &&
    first.expression.value === "use client"
  );
}

const boundaryRules = {
  "no-client-imports-server-only": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Client components must never import server-only modules or data stores directly.",
      },
      messages: {
        serverOnly:
          "Client components cannot import '{{mod}}'. Route data access through a server action ('use server') instead.",
        store:
          "Client components cannot import '{{mod}}' directly. Import from the domain's actions instead.",
      },
    },
    create(context) {
      if (!hasUseClientDirective(context)) return {};
      return {
        ImportDeclaration(node) {
          const mod = node.source.value;
          if (typeof mod !== "string") return;
          if (SERVER_ONLY_MODULES.includes(mod)) {
            context.report({
              node: node.source,
              messageId: "serverOnly",
              data: { mod },
            });
          } else if (STORE_MODULE_RE.test(mod)) {
            context.report({
              node: node.source,
              messageId: "store",
              data: { mod },
            });
          }
        },
      };
    },
  },
};

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      boundaries: { rules: boundaryRules },
    },
    rules: {
      "boundaries/no-client-imports-server-only": "error",
    },
  },
  // Default ignores of eslint-config-next.
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scratch/**",
    ],
  },
];

export default eslintConfig;
