import dataclasses
import importlib
import logging
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path
from shutil import rmtree

from algokit_utils.config import config
from dotenv import load_dotenv

# Set trace_all to True to capture all transactions for debugging
config.configure(debug=True, trace_all=False)

# Set up logging and load environment variables.
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s %(levelname)-10s: %(message)s"
)
logger = logging.getLogger(__name__)
logger.info("Loading .env")
load_dotenv()

# Determine the root path based on this file's location.
root_path = Path(__file__).parent

# ----------------------- Contract Configuration ----------------------- #

@dataclasses.dataclass
class SmartContract:
    path: Path
    name: str
    deploy: Callable[[], None] | None = None

def import_deploy_if_exists(folder: Path) -> Callable[[], None] | None:
    """Imports the deploy function from a folder if it exists."""
    try:
        module_name = f"smart_contracts.{folder.name}.deploy_config"
        deploy_module = importlib.import_module(module_name)
        return deploy_module.deploy  # type: ignore[no-any-return, misc]
    except ImportError as e:
        logger.debug(f"Could not import deploy for {folder.name}: {e}")
        return None

# FORCE ONLY GROUP_EXPENSE (Ignore Bank and Counter)
contracts: list[SmartContract] = [
    SmartContract(
        path=root_path / "group_expense" / "contract.py",
        name="group_expense",
        deploy=import_deploy_if_exists(root_path / "group_expense"),
    )
]

# -------------------------- Build Logic -------------------------- #

deployment_extension = "py"

def _get_output_path(output_dir: Path, deployment_extension: str) -> Path:
    """Constructs the output path for the generated client file."""
    return output_dir / Path(
        "{contract_name}"
        + ("_client" if deployment_extension == "py" else "Client")
        + f".{deployment_extension}"
    )

def build(output_dir: Path, contract_path: Path) -> Path:
    """Builds the contract and generates the Python client."""
    output_dir = output_dir.resolve()
    if output_dir.exists():
        rmtree(output_dir)
    output_dir.mkdir(exist_ok=True, parents=True)
    logger.info(f"Exporting {contract_path} to {output_dir}")

    build_result = subprocess.run(
        [
            "algokit",
            "--no-color",
            "compile",
            "python",
            str(contract_path.resolve()),
            f"--out-dir={output_dir}",
            "--no-output-arc32",
            "--output-arc56",
            "--output-source-map",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    if build_result.returncode:
        raise Exception(f"Could not build contract:\n{build_result.stdout}")

    app_spec_file_names: list[str] = [
        file.name for file in output_dir.glob("*.arc56.json")
    ]

    client_file: str | None = None
    if not app_spec_file_names:
        logger.warning("No ARC-56 file found. Skipping client generation.")
    else:
        for file_name in app_spec_file_names:
            client_file = file_name
            generate_result = subprocess.run(
                [
                    "algokit",
                    "generate",
                    "client",
                    str(output_dir),
                    "--output",
                    str(_get_output_path(output_dir, deployment_extension)),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            if generate_result.returncode:
                raise Exception(f"Could not generate typed client:\n{generate_result.stdout}")
    
    if client_file:
        return output_dir / client_file
    return output_dir

# --------------------------- Main Logic --------------------------- #

def main(action: str, contract_name: str | None = None) -> None:
    artifact_path = root_path / "artifacts"
    filtered_contracts = [
        c for c in contracts 
        if contract_name is None or c.name == contract_name
    ]

    match action:
        case "build":
            for contract in filtered_contracts:
                build(artifact_path / contract.name, contract.path)
        case "deploy":
            for contract in filtered_contracts:
                if contract.deploy:
                    logger.info(f"Deploying app {contract.name}")
                    contract.deploy()
                else:
                    logger.warning(f"No deploy configuration for {contract.name}")
        case "all":
            for contract in filtered_contracts:
                build(artifact_path / contract.name, contract.path)
                if contract.deploy:
                    contract.deploy()
        case _:
            logger.error(f"Unknown action: {action}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        main(sys.argv[1], sys.argv[2])
    elif len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        main("all")