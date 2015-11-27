import spark.Spark.*
import com.google.gson.Gson
import org.eclipse.jetty.websocket.api.*
import org.eclipse.jetty.websocket.api.annotations.*
import j2html.TagCreator.*
import j2html.tags.*
import java.util.*

fun toJson(message: String): String =  Gson().toJson(message)

val sessions: MutableMap<Session, String> = HashMap<Session, String>()

fun create(user: String = "User", text: String): String = "${user}: ${text}"

fun broadcast(message:  String) {
    sessions.keys.filter { s -> s.isOpen }.forEach { s ->
            try {
                s.remote.sendString(toJson(message))
            } catch (e: Exception) {
                e.printStackTrace()
            }
    }
}

@WebSocket
public class WebSocketHandler {

    @OnWebSocketConnect
    fun onConnect(session: Session) {
        sessions.put(session, "User")
        broadcast(create("User", "has joined the fun"))
    }

    @OnWebSocketMessage
    fun onMessage(message: String) {
        broadcast(message)
    }

    @OnWebSocketClose
    fun onClose(session: Session, state: Int, reason: String) {
        val username = sessions.get(session)
        broadcast(create("User", "has left the chat"))
    }
}

fun main(args: Array<String>) {

    staticFileLocation("/public")

    webSocket("/chat", WebSocketHandler::class.java)

    get("/", { req, res -> index()})

}

fun index() : String = document().render() +
        html().with(
                head().with(
                        title("K-Chat Server"),
                        link().withRel("stylesheet").withHref("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"),
                        script().withSrc("https://code.angularjs.org/tools/system.js"),
                        script().withSrc("https://code.angularjs.org/tools/typescript.js"),
                        script().withSrc("https://code.angularjs.org/2.0.0-alpha.46/angular2.dev.js"),
                        script().withSrc("https://code.angularjs.org/2.0.0-alpha.46/http.dev.js"),
                        script().withText("System.config({transpiler: 'typescript', typescriptOptions: { emitDecoratorMetadata: true }});" +
                                "System.import('./app.ts');")),
                body().with(
                        ContainerTag("myapp").withText("loading..."))
        )