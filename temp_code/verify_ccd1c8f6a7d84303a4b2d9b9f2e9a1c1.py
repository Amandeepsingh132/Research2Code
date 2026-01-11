import torch
import torch.nn as nn
import torch.optim as optim

# Define the residual block
class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        self.shortcut = nn.Conv2d(in_channels, out_channels, kernel_size=1) if in_channels != out_channels else None

    def forward(self, x):
        residual = x
        out = self.relu(self.conv1(x))
        out = self.conv2(out)
        if self.shortcut is not None:
            residual = self.shortcut(x)
        out += residual
        out = self.relu(out)
        return out

# Define the model
class ResNet(nn.Module):
    def __init__(self):
        super(ResNet, self).__init__()
        self.block = ResidualBlock(10, 10)

    def forward(self, x):
        out = self.block(x)
        return out

# Initialize the model, loss function, and optimizer
model = ResNet()
criterion = nn.MSELoss()
optimizer = optim.SGD(model.parameters(), lr=0.01)

# Train the model
input_data = torch.randn(1, 10, 10, 10)
label = torch.randn(1, 10, 10, 10)
loss_start = None
for i in range(10):
    optimizer.zero_grad()
    output = model(input_data)
    loss = criterion(output, label)
    loss.backward()
    optimizer.step()
    if i == 0:
        loss_start = loss.item()
print(f'LOSS_START: {loss_start}')

print(f'LOSS_END: {loss.item()}')