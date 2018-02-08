# Usage
0. ``gulp map --site http(s)://SITE_URL``
0. ``gulp parse --site http(s)://SITE_URL``
0. ``gulp rip --site http(s)://SITE_URL --selector  "#inner"``
0. ``gulp push --dest http(s)://NEW_SITE/wp-json/wp/v2/pages --auth "bWljaGFlbC5ob2xsZXJhbjphRHdqIEJ4OGcgSzdRaiB6SFhBIHJLeE0gYWlKdw=="``

# Get An App Password
0. Install https://wordpress.org/plugins/application-passwords/
0. Generate an Application Password http://YOUR_WP_SITE/wp-admin/profile.php
0. ``echo -n "admin:mypassword123" | base64``