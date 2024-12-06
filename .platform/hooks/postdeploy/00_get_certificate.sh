#!/bin/bash

# Add your domains here
DOMAINS=(
  "turt.us-east-1.elasticbeanstalk.com"
  "turtleshelterprojectdev.com"
)

# Join domains with -d flag
DOMAIN_ARGS=""
for DOMAIN in "${DOMAINS[@]}"; do
  DOMAIN_ARGS="$DOMAIN_ARGS -d $DOMAIN"
done

# Run certbot with the constructed domain arguments and --expand flag
sudo certbot -n --nginx $DOMAIN_ARGS --expand --agree-tos --email turnerklippel@gmail.com