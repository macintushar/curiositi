ALTER TABLE "curiositi_mcp_servers"
ADD COLUMN "headers_encrypted" text;

ALTER TABLE "curiositi_mcp_servers"
ALTER COLUMN "headers" DROP DEFAULT;
