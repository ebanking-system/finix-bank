# Multi-stage Dockerfile for .NET Notification Service
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder

WORKDIR /src
COPY EbankingNotificationService/EbankingNotificationService.csproj ./EbankingNotificationService/
RUN dotnet restore EbankingNotificationService/EbankingNotificationService.csproj

COPY EbankingNotificationService/ ./EbankingNotificationService/
WORKDIR /src/EbankingNotificationService
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app
COPY --from=builder /app/publish .

EXPOSE 5040

ENV ASPNETCORE_URLS=http://+:5040
ENV DOTNET_RUNNING_IN_CONTAINER=true

ENTRYPOINT ["dotnet", "EbankingNotificationService.dll"]
