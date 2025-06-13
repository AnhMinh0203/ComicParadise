FROM nginx:alpine

# Copy built Angular app from local to nginx folder
COPY dist/user/browser /usr/share/nginx/html

# Expose the default nginx port
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]