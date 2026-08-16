# Multi-stage Dockerfile for Eureka Server
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S finix && adduser -S finix -G finix
USER finix

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8761

ENV JAVA_OPTS="-Xms128m -Xmx256m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
