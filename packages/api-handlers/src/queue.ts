import { pushToQueue } from "@curiositi/queue";
import { createResponse } from "./response";

type EnqueueFileForProcessingParams = {
	fileId: string;
	orgId: string;
	qstashToken: string;
	workerUrl: string;
};
export async function enqueueFileForProcessing({
	fileId,
	orgId,
	qstashToken,
	workerUrl,
}: EnqueueFileForProcessingParams) {
	try {
		console.log(process.env.QSTASH_URL);
		const res = await pushToQueue({
			qstashToken,
			payload: {
				workerUrl,
				fileId,
				orgId,
			},
		});
		return createResponse(res, null);
	} catch (error) {
		return createResponse(null, error);
	}
}
