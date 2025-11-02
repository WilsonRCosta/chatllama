package personal.chatbot.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import personal.chatbot.model.ChatRequest;
import personal.chatbot.service.ChatService;
import reactor.core.publisher.Flux;

import java.awt.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin("*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping(
            path = "/stream",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public Flux<String> ask(@RequestBody ChatRequest request) {
        return chatService.ask(request.input(), request.model());
    }
}
