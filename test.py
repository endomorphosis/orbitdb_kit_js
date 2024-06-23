from orbitdb_kit import orbitdb_kit
import asyncio
import subprocess
import time
resources = {}
meta = {}
port_scan_cmd = "lsof -i -P -n | grep LISTEN | grep 50001 | awk '{print $2}'"
port_scan_results = subprocess.check_output(port_scan_cmd, shell=True).decode('utf-8').strip()
if port_scan_results != "":
    kill_cmd = "kill -9 " + port_scan_results
    kill = subprocess.Popen(kill_cmd, shell=True)
orbitdb_kit = orbitdb_kit(resources, meta)
start = orbitdb_kit.start_orbitdb()
# wait until port is open
port_scan_results = subprocess.check_output(port_scan_cmd, shell=True).decode('utf-8').strip()
while port_scan_results == "":
        port_scan_results = subprocess.check_output(port_scan_cmd, shell=True).decode('utf-8').strip()
connect = asyncio.run(orbitdb_kit.connect_orbitdb())
time.sleep(5)
kill_cmd = "kill -9 " + port_scan_results
kill = subprocess.Popen(kill_cmd, shell=True)
time.sleep(5)
print("done")
