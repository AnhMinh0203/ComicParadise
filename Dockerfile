FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy thư mục publish
COPY ./ComicParadise/bin/Release/net8.0/publish/ .

ENTRYPOINT ["dotnet", "ComicParadise.Api.dll"]