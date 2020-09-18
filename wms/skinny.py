from wmssvr import application


__all__ = [
    "main",
]


def main():
    application.run(host="0.0.0.0",debug=True, threaded=False)


if __name__ == "__main__":
    main()
