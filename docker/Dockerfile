FROM alpine:3.21.3
RUN apk add --no-cache \
    ca-certificates \
    openssl \
    openssl-dev \
    curl \
    bash \
    libstdc++ \
    libgcc \
    nodejs \
    npm

RUN curl -fsSL https://claude.ai/install.sh | bash

ENV PATH="/root/.local/bin:${PATH}"

ENV AWS_BEARER_TOKEN_BEDROCK=""
ENV ANTHROPIC_MODEL="arn:aws:bedrock:ap-southeast-2:258049739530:inference-profile/global.anthropic.claude-opus-4-5-20251101-v1:0"
ENV ANTHROPIC_SMALL_FAST_MODEL="arn:aws:bedrock:ap-southeast-2:258049739530:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0"
ENV AWS_REGION=ap-southeast-2
ENV CLAUDE_CODE_USE_BEDROCK=1