import docker
import os
import uuid

def run_code_in_docker(generated_code):
    client = docker.from_env()
    
    # Create a unique temp file for the code
    filename = f"verify_{uuid.uuid4().hex}.py"
    host_path = os.path.abspath("temp_code")
    if not os.path.exists(host_path):
        os.makedirs(host_path)
        
    file_path = os.path.join(host_path, filename)
    with open(file_path, "w") as f:
        f.write(generated_code)

    try:
        # Run the container and capture the output
        # Removed 'timeout' as it's not a valid argument for run()
        logs_bytes = client.containers.run(
            image="pytorch/pytorch:latest",
            command=f"python /data/{filename}",
            volumes={host_path: {'bind': '/data', 'mode': 'rw'}},
            working_dir="/data",
            detach=False, # Wait for it to finish
            remove=True,   # Auto-remove container after run
            mem_limit="1g"
        )
        
        logs = logs_bytes.decode("utf-8")
        os.remove(file_path)
        return logs
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return f"Execution Error: {str(e)}"