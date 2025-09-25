import requests
import dotenv
import os

dotenv.load_dotenv()

HOST = os.getenv("HOST") or "localhost"
PORT = os.getenv("PORT") or 12345

def prompt():
    print("User: ", end="")

    lines = []

    while True:
        try:
            lines.append(input())
        except EOFError:
            break

    return "\n".join(lines)

def clear():
    print("\nClearing history...")

    response = requests.post(f"http://{HOST}:{PORT}/api/clear")

    if response.status_code == 200:
        print("Chat history cleared\n")
    else:
        raise Exception("Error:", response.status_code, response.text)

def chat(model, user_input):
    print("\nThinking...")

    response = requests.post(f"http://{HOST}:{PORT}/api/chat", json={"model": model, "prompt": user_input})

    if response.status_code == 200:
        print(f"\nOllama: {response.json()["msg"]}\n")
    else:
        raise Exception("Error:", response.status_code, response.text)

def main():
    model = input("Input the name of the model avaliable in Ollama (leave empty to use default): ")

    print("Enter and then Ctrl-D or Ctrl-Z ( windows ) to sumbit your prompt.\n")

    while True:
        user_input = prompt()

        if user_input == "/bye":
            break
        elif user_input == "/clear":
            clear()
        else:
            chat(model, user_input)

if __name__ == "__main__":
    main()
