import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

const toBeBundled: string[] = [
    "connect-pg-simple",
    "date-fns",
    "drizzle-orm",
    "drizzle-zod",
    "express",
    "express-session",
    "memorystore",
    "multer",
    "passport",
    "passport-local",
    "pg",
    "ws",
    "zod",
    "zod-validation-error"
];

async function buildAll(): Promise<void> {
    await rm("dist", { recursive: true, force: true });

    console.log("Building client...");
    await viteBuild();

    console.log("Building server...");
    const pkg = JSON.parse(await readFile("package.json", "utf-8"));

    const allDeps: string[] = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
    ];

    const externals = allDeps.filter((dep) => !toBeBundled.includes(dep));

    await esbuild({
        entryPoints: ["server/index.ts"],
        platform: "node",
        bundle: true,
        format: "cjs",
        outfile: "dist/index.cjs",
        define: {
            "process.env.NODE_ENV": '"production"',
        },
        minify: true,
        external: externals,
        logLevel: "info",
    });
}

buildAll().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
});