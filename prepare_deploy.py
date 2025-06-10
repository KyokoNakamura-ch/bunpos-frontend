import os
import shutil

base_dir = os.getcwd()
deploy_dir = os.path.join(base_dir, "deploy")
standalone_dir = os.path.join(base_dir, ".next", "standalone")

# deploy フォルダ削除 & 再作成
if os.path.exists(deploy_dir):
    shutil.rmtree(deploy_dir)
os.makedirs(deploy_dir)

# .next → _next フォルダとしてコピー
next_src = os.path.join(standalone_dir, ".next")
next_dst = os.path.join(deploy_dir, "_next")
if os.path.exists(next_src):
    shutil.copytree(next_src, next_dst)

# public フォルダをコピー
public_src = os.path.join(base_dir, "public")
public_dst = os.path.join(deploy_dir, "public")
if os.path.exists(public_src):
    shutil.copytree(public_src, public_dst)

# server.js を deploy にコピー
server_src = os.path.join(standalone_dir, "server.js")
server_dst = os.path.join(deploy_dir, "server.js")
if os.path.exists(server_src):
    shutil.copy(server_src, server_dst)
else:
    print("⚠️ server.js が見つかりません")

# package.json をコピー
pkg_src = os.path.join(standalone_dir, "package.json")
pkg_dst = os.path.join(deploy_dir, "package.json")
if os.path.exists(pkg_src):
    shutil.copy(pkg_src, pkg_dst)

# node_modules を deploy にコピー（これが今回追加部分！）
node_modules_src = os.path.join(standalone_dir, "node_modules")
node_modules_dst = os.path.join(deploy_dir, "node_modules")
if os.path.exists(node_modules_src):
    shutil.copytree(node_modules_src, node_modules_dst)
else:
    print("⚠️ node_modules が見つかりません")

print("✅ 完了：deploy フォルダを ZIP用構成に整えました！")
