// Counts every stacked (statement) block, including blocks nested inside
// if / repeat blocks and inside every branch of a Bird if block.
export function countBlocks(program) {
  return program.reduce((total, block) => {
    const nested = block.children ? countBlocks(block.children) : 0;
    const branches = block.branches
      ? block.branches.reduce((sum, branch) => sum + countBlocks(branch.children), 0)
      : 0;
    return total + 1 + nested + branches;
  }, 0);
}

// Collects every block id in a program, depth first.
export function blockIds(program) {
  return program.flatMap((block) => [
    block.id,
    ...(block.children ? blockIds(block.children) : []),
    ...(block.branches ? block.branches.flatMap((branch) => blockIds(branch.children)) : []),
  ]);
}
