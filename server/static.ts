import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express): void {
    const distPath = path.resolve(__dirname, "public");

    if (!fs.existsSync(distPath)) {
        console.warn(`[Warning] Build directory not found: ${distPath}. Make sure to run 'npm run build' first.`);
        return;
    }

    app.use(express.static(distPath));

    app.use('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}