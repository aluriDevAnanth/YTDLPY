import logging
from rich.console import Console
from rich.logging import RichHandler

console = Console()

logging.basicConfig(
    level="INFO",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[
        RichHandler(
            console=console,
            rich_tracebacks=True,
            markup=True,            # Render rich markup tags [bold green], [cyan], etc.
            show_path=True,          # Display source file location on right
            enable_link_path=True,   # Make file path clickable to jump directly to code location
            tracebacks_show_locals=False
        )
    ]
)

logger = logging.getLogger("ytdlp_gui")

def log_info(msg: str):
    logger.info(f"[cyan]{msg}[/cyan]", stacklevel=2)

def log_success(msg: str):
    logger.info(f"[bold green]✨ {msg}[/bold green]", stacklevel=2)

def log_warning(msg: str):
    logger.warning(f"[bold yellow]⚠️ {msg}[/bold yellow]", stacklevel=2)

def log_error(msg: str, exc: Exception = None):
    if exc:
        logger.error(f"[bold red]❌ {msg}[/bold red]", exc_info=exc, stacklevel=2)
    else:
        logger.error(f"[bold red]❌ {msg}[/bold red]", stacklevel=2)
