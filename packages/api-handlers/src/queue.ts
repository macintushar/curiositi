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
		const res = await pushToQueue({
			qstashToken,
			qstashUrl:
				process.env.NODE_ENV === "development"
					? process.env.QSTASH_URL
					: undefined,
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
