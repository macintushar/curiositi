import { Client } from "@upstash/qstash";

type Payload = {
	workerUrl: string;
	fileId: string;
	orgId: string;
};

type PushToQueueProps = {
	qstashToken: string;
	qstashUrl?: string;
	payload: Payload;
};

export async function pushToQueue({
	qstashToken,
	qstashUrl,
	payload,
}: PushToQueueProps) {
	const client = new Client({
		token: qstashToken,
		baseUrl: qstashUrl,
	});

	const res = await client.publishJSON({
		url: `${payload.workerUrl}/process-file`,
		body: {
			fileId: payload.fileId,
			orgId: payload.orgId,
		},
		method: "POST",
	});

	return res;
}
