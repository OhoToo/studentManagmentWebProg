FROM maven:3-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src ./src
COPY html ./html
COPY css ./css
COPY js ./js
COPY favicon.png ./
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/myproject-0.0.1-SNAPSHOT.jar ./app.jar
COPY docker/application.properties ./application.properties
COPY docker/backend-entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh \
    && mkdir /app/secrets && chown 10001:10001 /app/secrets
ENV SPRING_CONFIG_LOCATION=file:/app/application.properties
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
