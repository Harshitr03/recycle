document.getElementById('send-btn').addEventListener('click', function() {
    const imageInput = document.getElementById('image-input');
    const chatBox = document.getElementById('chat-box');

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();

        // Create user image message
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.classList.add('image-preview', 'user-message');
            
            chatBox.appendChild(img);
            chatBox.scrollTop = chatBox.scrollHeight;

            // Simulate bot response (you can customize this part)
            setTimeout(function() {
                const botMessage = document.createElement('div');
                botMessage.classList.add('message', 'bot-message');
                botMessage.textContent = "I see you uploaded an image!";
                chatBox.appendChild(botMessage);
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 500);
        };
        
        reader.readAsDataURL(file);

        // Clear file input after image is loaded
        imageInput.value = '';
    } else {
        alert('Please select an image first!');
    }
});

// New Chat button functionality
document.getElementById('new-chat-btn').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    
    // Clear chat messages
    chatBox.innerHTML = '';
    
    // idar se input device ka handle kro
    const initialMessage = document.createElement('div');
    initialMessage.classList.add('message', 'bot-message');
    initialMessage.textContent = "Hello! Please upload an image to get started.";
    chatBox.appendChild(initialMessage);
});
