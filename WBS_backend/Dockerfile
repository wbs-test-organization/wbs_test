FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
 
COPY ["WBS_backend.csproj", "./"]
RUN dotnet restore "WBS_backend.csproj"
 
COPY . .
 
RUN dotnet publish "WBS_backend.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore
 
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
 
USER $APP_UID
 
WORKDIR /app
 
COPY --from=build /app/publish .
# Copy production.env vào container để đọc environment variables
COPY --from=build /src/production.env .
 
EXPOSE 8080
 
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV TZ=Asia/Ho_Chi_Minh
ENTRYPOINT ["dotnet", "WBS_backend.dll"]