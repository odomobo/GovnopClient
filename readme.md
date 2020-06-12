# Govnop

Quick and dirty web app to allow me to play games with my friends. This contains the client under site/ and the server under GovopBackend.

The client is html + javascript + jquery. It's very quick and dirty. It keeps track of all previously processed events, and listens for new events using long polling. When the page is refreshed, it will pull an event listing of all events that happened since the server started. This allows for all clients to share the same state.

The client must be provided the server's url in the query string. For example, if the server is running on https://server.example.com:1111 and the client is located on http://client.example.com:8080 , then you'd use this as the link: http://client.example.com:8080?server=https://server.example.com:1111

The server is essentially a sequenced event queue. Events are sequenced into a shared order for all clients, and those events are then pumped to all clients (all clients listening). Pinging is used to determine when clients connect and disconnect, and is also used to update nicknames (if a ping has a different nickname, then a "renamed" event gets pushed out).