import asyncio
import selectors
import sys
import uvicorn

if __name__ == "__main__":
    if sys.platform == "win32":
        loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
        asyncio.set_event_loop(loop)
    else:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    config = uvicorn.Config(
        "app.main:app",
        host="127.0.0.1",
        port=8002,
        loop="none",
        log_level="info",
    )
    server = uvicorn.Server(config)
    try:
        loop.run_until_complete(server.serve())
    finally:
        loop.close()
