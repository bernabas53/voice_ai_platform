import { readFileSync } from 'fs';
import { join } from 'path';

interface CommonSiteConfig {
	webserver_port: number;
}

// Read common site config
const configPath = join(process.cwd(), '../../../sites/common_site_config.json');
let webserverPort = 8000; // Default fallback

try {
	const configData = readFileSync(configPath, 'utf8');
	const commonSiteConfig = JSON.parse(configData) as CommonSiteConfig;
	webserverPort = commonSiteConfig.webserver_port;
} catch {
	console.warn('Could not read common_site_config.json, using default port 8000');
}

interface ProxyConfig {
	target: string;
	ws: boolean;
	router: (req: { headers: { host: string } }) => string;
}

const proxyOptions: Record<string, ProxyConfig> = {
	'^/(app|api|assets|files|private)': {
		target: `http://127.0.0.1:${webserverPort}`,
		ws: true,
		router: function(req: { headers: { host: string } }) {
			const siteName = req.headers.host.split(':')[0];
			return `http://${siteName}:${webserverPort}`;
		}
	}
};

export default proxyOptions;
