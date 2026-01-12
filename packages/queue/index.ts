import { Client } from "@upstash/qstash";

type Payload = {
	workerUrl: string;
	fileId: string;
	orgId: string;
};

type PushToQueueProps = {
	qstashToken: string;
	payload: Payload;
};
export async function pushToQueue({ qstashToken, payload }: PushToQueueProps) {
	// const client = new Client({
	// 	token: qstashToken,
	// 	baseUrl: process.env.QSTASH_URL,
	// });
	// const res = await client.publishJSON({
	// 	url: `${payload.workerUrl}/process-file`,
	// 	payload: {
	// 		fileId: payload.fileId,
	// 	},
	// 	method: "POST",
	// });
	const res = await fetch(
		` http://127.0.0.1:8080/v2/publish/${payload.workerUrl}/process-file`,
		{
			headers: {
				Authorization: `Bearer ${qstashToken}`,
			},
			method: "POST",
			body: JSON.stringify({
				fileId: payload.fileId,
				orgId: payload.orgId,
			}),
		}
	);
	return await res.json();
}
