import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	timeout: 30_000,
	expect: {
		timeout: 5_000,
	},
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL: "http://127.0.0.1:5180",
		trace: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "bun --cwd ../webapp dev --host 127.0.0.1 --port 5180",
		url: "http://127.0.0.1:5180",
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});
