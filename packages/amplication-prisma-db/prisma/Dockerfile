FROM node:24.7.0-trixie-slim
RUN openssl version -v
RUN uname -a

# Install Prisma for the migration
RUN npm install -g @prisma/cli

# Copy schema and migration folder
ADD ./ ./prisma/

CMD [ "prisma", "migrate", "up", "--experimental"]