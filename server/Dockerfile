FROM oven/bun:1.1.42

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy the rest of the code
COPY . .

EXPOSE 3030

CMD ["bun", "run", "start"] 